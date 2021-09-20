const { execute } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');
const gql = require('graphql-tag');
const prompt = require('prompt');

const CONFIG = {
  API_SUBSCRIPTION_URL: 'wss://iot.dimensionfour.io/subscription',
  TENANT_ID: 'apphuset-demo',
  API_ACCESS_TOKEN: '',
};

async function main() {
  const wsClient = getWsClient({
    wsUrl: CONFIG.API_SUBSCRIPTION_URL,
    httpHeaders: {
      'x-tenant-id': CONFIG.TENANT_ID,
      'x-tenant-key': CONFIG.API_ACCESS_TOKEN,
    },
  });

  const {
    spaceId = '',
    minTemperature = '18',
    maxTemperature = '25',
  } = await prompt.get(['stockSpaceId', 'minTemperature', 'maxTemperature']);

  const STOCK_SIGNALS_SUBSCRIPTION_QUERY = gql`
    subscription StockSignals($spaceId: ID!) {
      signalAdded(where: { spaceId: $spaceId }) {
        unit
        type
        createdAt
        data {
          rawValue
          numericValue
        }
      }
    }
  `;

  const stockSignalsSubscriptionObservable = createSubscriptionObservable({
    wsClient,
    query: STOCK_SIGNALS_SUBSCRIPTION_QUERY,
    variables: { spaceId },
  });

  stockSignalsSubscriptionObservable.subscribe(
    (signalResult) => {
      const { unit, data, type } = signalResult.data.signalAdded;

      if (unit !== 'CELSIUS_DEGREES') {
        return;
      }

      const { numericValue } = data;

      if (
        numericValue < parseFloat(minTemperature) ||
        numericValue > parseFloat(maxTemperature)
      ) {
        console.log(`Invalid conditions! ${numericValue} ${unit} for ${type}`);
      }
    },
    (error) => console.log(error),
  );
}

function getWsClient({ wsUrl, httpHeaders = {} }) {
  return new SubscriptionClient(
    wsUrl,
    {
      reconnect: true,
      connectionParams: { ...httpHeaders },
      timeout: 30000,
    },
    ws,
  );
}

function createSubscriptionObservable({ wsClient, query, variables }) {
  const link = new WebSocketLink(wsClient);
  return execute(link, { query: query, variables: variables });
}

main();
