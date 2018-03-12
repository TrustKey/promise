### TrustKey Promise

Promise is a [supervisor][2] module, fundamental TrustKey concept which allows to receive similar results based on trustkey service data.

TrustKey promise is a JSON object, containing "_f" property, which points promise module to call certain algorithm to resolve promise.

Promise objects may be nested. To resolve promise means to replace all promise sub-objects with actual values by calling promise algorithms.

Promise-based algorithm [example][0].

[0]: https://github.com/TrustKey/trustkey_argon2d
[2]: https://github.com/TrustKey/supervisor