# Cloud Computing HW1 - Parking Lot Management

## Introduction

This project uses Pulumi to create a cloud infrastructure for a parking lot management system.
It consists of an API Gateway, a Lambda function and a DynamoDB table.

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

To remove the infrastructure, you can run:

```bash
pulumi destroy
```

## API

The API Gateway has the following routes:

### Entry
`POST /entry?plate=PLATE&parkingLot=LOT`:

Registers a car entry in the parking lot. The response will contain the ticket ID:
  ```json
  {
    "ticketId": "1234"
  }
  ```

### Exit
`POST /exit?ticketId=TICKET_ID`: 
Registers a car exit from the parking lot. The response will information regarding the parking fee:

  ```json
{
    "plate": "00-11-23",
    "parkingLot": "80",
    "parkedTime": "0 hours, 18 minutes",
    "charge": 5
}
  ```
