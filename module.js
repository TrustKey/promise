const crypto = require('crypto');
const encodeResponseBuffers = require('./encodeResponseBuffers');

class PromiseService {
    constructor() {
        this.algorithms = [];
    }

    postAlgorithm(algorithm) {
        if (!algorithm || !algorithm.name || !algorithm.createPromise || !algorithm.resolvePromise)
            throw("Wrong algorithm");

        if(this.algorithms.filter(a => a.name === algorithm.name)[0]) {
            throw("An algorithm with the specified name already posted");
        }

        this.algorithms.push(algorithm);
    }

    tryFindTargetAlgorithm(request, callback) {
        if(!request || !request["promise_alg"]) {
            callback({success: false, error: "No promise_alg supplied"});
            return null;
        }

        const targetAlgorithm = this.algorithms.filter((a) => a.name === request["promise_alg"])[0];

        if(!targetAlgorithm) {
            callback({success: false, error: "Unable to find target algorithm"});
            return null
        }

        return targetAlgorithm;
    }

    createPromise(request, callback) {
        const algorithm = this.tryFindTargetAlgorithm(request, callback);
        if(algorithm)
            algorithm.createPromise(request, request.b64_buffers ? encodeResponseBuffers(callback): callback);
    }

    resolvePromise(request, callback) {
        const algorithm = this.tryFindTargetAlgorithm(request, callback);
        if(algorithm)
            algorithm.resolvePromise(request, request.b64_buffers ? encodeResponseBuffers(callback): callback);
    }

    /*
     *
     * Resolves a promise if request object is a promise instance
     * (has `promise_alg` property). Otherwise returns request
     * object similar to a promise result with the `is_not_promise`
     * positive boolean:
     *
     * {"success": true, "is_not_promise": true, "result": $request }
     *
     */

    tryResolvePromise(request, callback) {
        if(!request || !request['promise_alg'])
            return callback({success: true, is_not_promise: true, result: request});

        this.resolvePromise(request, callback);
    }

    /*
     *
     * Creates a promise if request object is a promise request instance
     * (has `promise_alg` property). Otherwise wraps request
     * object similar to a promise creation result with the `is_not_promise`
     * positive boolean:
     *
     * {"success": true, "is_not_promise": true, "result": $request }
     *
     */

    tryCreatePromise(request, callback) {
        if(!request || !request['promise_alg'])
            return callback({success: true, is_not_promise: true, result: request});

        this.createPromise(request, callback);
    }
};

module.exports = function setup(options, imports, register) {
    console.log("tk-promise module setup");

    register(null, {
        promise: new PromiseService()
    });
};