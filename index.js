const request = require("request");
const crypto = require('crypto');

module.exports = (config) => {
    // We need the Hash, email and secret from G2A Pay
    // Setting test as not necessary value, can be triggered from main project
    if(!config.secret || !config.hash || !config.email || !config.url_ok || !config.url_failure)
    {
        console.log("ERROR node-g2apay exiting: Config is invalid");
        process.exit(1);
    }
    let CHECKOUT_URL = ""; // will be setted later
    const CHECKOUT_TEST_URL = "https://checkout.test.pay.g2a.com";
    const CHECKOUT_PROD_URL = "https://checkout.pay.g2a.com";
    if(config.test == undefined) config.test = false;
    let REST_URL = "";
    const REST_TEST_URL = "https://www.test.pay.g2a.com/rest";
    const REST_PROD_URL = "https://pay.g2a.com/rest";
    if(config.test) // check for test param
    {
        console.log("node-g2apay: Using test enviroment, logging enabled");
        CHECKOUT_URL = CHECKOUT_TEST_URL;
        REST_URL = REST_TEST_URL;
    }else{
        CHECKOUT_URL = CHECKOUT_PROD_URL;
        REST_URL = REST_PROD_URL;
    }
    // Function for http request

    // Internal functions
    function calculateOrderHash(orderId, totalPrice, currency) {
        const unencrypted = orderId + totalPrice + currency + config.secret;
        const hash = crypto.createHmac('sha256', unencrypted).digest("hex");
        if(config.test) console.log("node-g2apay: Calculated Order Hash - " + hash);
        return hash;
    }

    function calcuateAuthHash() {
        const hash = crypto.createHmac('sha256', config.hash + config.email + config.secret).digest('hex');
        console.log(hash);
        return hash;
    }
    function calculateRefundHash(transactionId, userOrderId, amount, refundedAmount) {
        const hash = crypto.createHmac('sha256', transactionId + userOrderId + amount + refundedAmount + config.secret).digest('hex');
        console.log(hash);
        return hash;
    }
    // Public functions
    return {
        createCheckout: (orderId, totalPrice, currency, items, callback) => {
            request.post(CHECKOUT_URL + "/index/createQuote", {"form": {
                    "api_hash": config.hash,
                    "hash": calculateOrderHash(orderId, totalPrice, currency),
                    "order_id": orderId,
                    "amount": totalPrice,
                    "currency": currency,
                    "url_ok": config.url_ok,
                    "url_failure": config.url_failure,
                    "items": items
                }
            }, (error, response, body) => {
                var json = JSON.parse(body);
                if(json.status === "ok"){
                    callback({"url": CHECKOUT_URL + "/index/gateway?token=" + json.token});
                }else{
                    callback(json);
                }
            })
        },
        // maybe works, maybe doesnt
        getPayment: (transactionId, callback) => {
            let options = {
                "url": REST_URL + "/transactions/" + transactionId,
                "headers": {
                    "Authorization": {
                    'apiHash': config.hash,
                    'hash': calcuateAuthHash()
                }}
            }
            request.get(options,(err, response, body) => {
                    if(body != "\"unauthorized\"") {
                        callback(JSON.parse(body));
                    }else{
                        callback({"status": false, "message": "Server returned unauthorized"})
                    }
            });
        },
        // maybe works, not tested
        refundPayment: (transactionId, userOrderId, amount, refundAmount, callback) => {
            let options = {
                method: "PUT",
                "uri": REST_URL + "/transactions/" + transactionId + "?action=refund&amount=" + amount + "&hash=" + calculateRefundHash(transactionId, userOrderId, amount, refundAmount),
                "headers": {
                    "Authorization": {
                        'apiHash': config.hash,
                        'hash': calcuateAuthHash()
                    }}
            }

            request(options,(err, response, body) => {
                if(body != "\"unauthorized\"") {
                    callback(JSON.parse(body));
                }else{
                    callback({"status": false, "message": "Server returned unauthorized"})
                }
            });
        },
        // todo
        checkIPN: (body) => {

        }

    }

}