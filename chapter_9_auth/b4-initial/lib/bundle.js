/**
* Provides API endpoints for working with book bundles.
*/
const express = require('express');
const rp = require('request-promise');
const getUserKey = ({user: {provider, id}}) => `${provider}-${id}`;


module.exports = es => {
    const url = `http://${es.host}:${es.port}/${es.bundles_index}/bundle`;
    const router = express.Router();

    /**
    * All of these APIs require the user to have authenticated.
    */
    router.use((req, res, next) => {
        if(!req.isAuthenticated()) {
            res.status(403).json({
                error: 'You mush sign in to use this service.',
            });
            return;
        }
        next();
    })

    /**
    * List bundles for the currently authenticated user.
    */
    router.get('/list-bundles', async (req, res) => {
        try {
            const esReqBody = {
                size: 1000,
                query: {
                    math: {
                        userKey: getUserKey(req),
                    }
                },
            };

            const options = {
                url: `${url}/_search`,
                json: true,
                body: esReqBody,
            };

            const esResBody = await rp(options);
            const bundles = esResBody.hits.hits.map(hit => ({
                id: hit._id,
                name: hit._source.name,
                }));
            res.status(200).json(bundles);
        } catch (err) {
            res.status(err.statusCode || 502).json(err.error || err)
        }
    })

    return router;
}