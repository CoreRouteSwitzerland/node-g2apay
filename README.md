# node-g2apay

Opensource module for G2A Pay written in NodeJS

# Usage
```
const g2aconfig = {
    "hash": "G2A Shop Hash", // find these infos on G2A Merchant Dashboard
    "email": "G2A Shop Email",
    "secret": "G2A Shop Secret", 
    "test": true, // true = sandbox, false = production
    "url_ok": "OK URL", // fill in an URL where it redirects on success
    "url_failure": "Fail URL" // fill in an URL where it redirects on failure
}

const g2a = require("../index")(g2aconfig);
```

# Functions

Create a payment
```
g2a.createCheckout("035434", 1000.00, "CHF", [
    {
        "sku": "1337",
        "name": "Testproduct",
        "amount": "15",
        "qty": "1",
        "price":15,
        "id":"5619",
        "url":"http://example.com/products/item/example-item-name-5619"
    },
], (response) => {
    // do something with it
    console.log(response);
});
```
Get details on a payment
```
g2a.getPayment(transactionId, (response) => {
    // do something with response
    console.log(response)
});
```

Refund a payment
```
                                                          
g2a.refundPayment(transactionId, userOrderId, paymentAmount, refundAmount,"1", (response) => {
    // do something with response
    console.log(response)
});
```
