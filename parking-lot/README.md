# Cloud Computing HW1 - Parking Lot Management

## Introduction

This project uses Pulumi to create a cloud infrastructure for a parking lot management system.
It consists of an API Gateway, a Lambda function and a DynamoDB table.

## Code

The code is organized as follows:

### Infrastructure code
- `index.ts`: The main Pulumi program that defines the infrastructure. It uses the following files:
- `src/infrastructure/api.ts`: The API Gateway.
- `src/infrastructure/lambda.ts`: The Lambda function.
- `src/infrastructure/dynamodb.ts`: The DynamoDB table.
- `src/infrastructure/role.ts`: The IAM role for the Lambda function.

### Lambda function code
- `src/functions/index.mjs`: The Lambda function code entry point, which handles the API requests
- `src/functions/entry.mjs`: The entry API endpoint handler
- `src/functions/exit.mjs`: The exit API endpoint handler

## Deployment

To deploy the infrastructure, you need to have Pulumi installed and configured.

Make sure to also define your AWS credentials in the environment variables:

```bash
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET
```

Then, you can run the following commands:

```bash
pulumi up
```

This will output the main API Gateway URL, which you can use to interact with the different endpoints.

To remove the infrastructure, you can run:

```bash
pulumi destroy
```

## API

The API Gateway has the following routes:

### Entry
`POST /entry?plate=PLATE&parkingLot=LOT`:

Registers a car entry in the parking lot. The response will contain the created ticket ID.

Example response:
  ```json
  {
    "ticketId": "1234"
  }
  ```

  Note: A double entry with the same plate will override the previous entry.

### Exit
`POST /exit?ticketId=TICKET_ID`: 
Registers a car exit from the parking lot. The response will information regarding the parking charge ($10 per hour in 15 minutes intervals).

Example response:
  ```json
{
    "plate": "00-11-23",
    "parkingLot": "80",
    "parkedTime": "0 hours, 18 minutes",
    "charge": "$5"
}
  ```
