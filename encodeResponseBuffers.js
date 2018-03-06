//Encodes every Buffer instance with base64

function iterate(obj) {
    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if(obj[property] instanceof Buffer)
                obj[property] = obj[property].toString("base64");
            else {
                if (typeof obj[property] === "object")
                    iterate(obj[property]);
            }
        }
    }

    return obj;
}

module.exports = (callback) => {
    return (response) => {
        callback(iterate(response));
    }
};