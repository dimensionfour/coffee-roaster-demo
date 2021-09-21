# Coffee roaster demo

Sources for D4 demo for coffee roaster

## Demo usecase

- Coffee roaster with 2 coffee stocks (roasted and not roasted)
- Both stocks needs to keep optimal conditions (temperature, humidity, etc.) 
- Employees should receive Slack notification when conditions are not optimal

## Conditions

- Not roasted coffee: 18-25°C
- Roasted coffee: 4-10°C

## GraphQL calls

You can run all calls from [`graphql`](./graphql) in D4 GraphQL Playground on [`iot.dimensionfour.io/graph`](https://iot.dimensionfour.io/graph)

## Notification service

```shell
cd notification-service
yarn install
yarn start
```
