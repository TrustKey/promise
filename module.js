const crypto = require('crypto');
const encodeResponseBuffers = require('./encodeResponseBuffers');

const errorCodes = {
    0: "Unable to resolve sub-promise"
};

class PromiseService {
    constructor() {
        this.algorithms = [];
    }

    postAlgorithm(algorithm) {
        if (!algorithm || !algorithm.name || typeof algorithm.resolve !== 'function')
            throw("Wrong algorithm");

        if(this.algorithms.filter(a => a.name === algorithm.name)[0]) {
            throw("An algorithm with the specified name already posted");
        }

        this.algorithms.push(algorithm);
    }

    resolve(request, resolve, reject) { //reject function is optional argument
        if(!reject) {
            let callback = resolve;
            resolve = (response) => {
                callback({
                    success: true,
                    result: response
                });
            };

            reject = (response) => {
                if(typeof response === "object") {
                    response.success = false;
                    callback(response);
                }
                else
                    callback({
                        success: false,
                        error: response
                    });
            };
        }

        if(!request || typeof request !== 'object' || typeof request["_f"] !== 'string')
            return reject({error: "No _f supplied"});

        const targetAlgorithm = this.algorithms.filter((a) => a.name === request["_f"])[0];
        if(!targetAlgorithm)
            return reject({error: "Unable to find target algorithm"});

        //Resolving sub-promises recursively
        for(let k in request) {
            let property = request[k];
            if(typeof property === 'object' && typeof property._f === 'string') {
                if(!request.___resolved)
                    request.___resolved = [];
                if(request.___resolved.filter(propertyName => propertyName === k)[0])
                    continue;
                else
                    request.___resolved.push(k);

                this.resolve(property,
                    (response) => { //We've resolved a promise property, try to resolve promise again
                        request[k] = response;
                        return this.resolve(request, resolve, reject);
                    },
                    (response) => { //Sub-promise rejected
                        reject({
                            error_code: 0,
                            error: errorCodes[0],
                            error_data: {
                                algorithm: property._f,
                                response: response
                            }
                        });
                    }
                );

                return;
            }
        }

        delete request.___resolved;

        targetAlgorithm.resolve(
            request,
            request.b64_buffers ? encodeResponseBuffers(resolve): resolve,
            request.b64_buffers ? encodeResponseBuffers(reject): reject
        );
    }
};

module.exports = function setup(options, imports, register) {
    console.log("tk-promise module setup");

    register(null, {
        promise: new PromiseService()
    });
};