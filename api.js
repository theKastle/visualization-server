const googleTrends = require('google-trends-api');
module.exports.setUp = function(server) {
  server.get('/relatedTopics', function(req, res) {
    googleTrends
      .relatedTopics({ keyword: req.query.keyword })
      .then(function(results) {
        const parsedResult = JSON.parse(results);
        console.log(parsedResult.default.rankedList[0]);

        const finalResult = parsedResult.default.rankedList[0].rankedKeyword.map(
          t => {
            return {
              id: t.topic.title,
              value: t.value,
              type: t.topic.type
            };
          }
        );
        return res.send(finalResult);
      })
      .catch(function(err) {
        console.error('Oh no there was an error', err);
        return res.send(500);
      });
  });

  server.get('/relatedQueries', function(req, res) {
    console.log(req.query.keyword);
    googleTrends
      .relatedQueries({ keyword: req.query.keyword })
      .then(function(results) {
        const parsedResult = JSON.parse(results);
        console.log(parsedResult.default.rankedList[0]);

        const finalResult = parsedResult.default.rankedList[0].rankedKeyword.map(
          t => {
            return {
              id: t.query,
              value: t.value
            };
          }
        );
        return res.send(finalResult);
      })
      .catch(function(err) {
        console.error('Oh no there was an error', err);
        return res.send(500);
      });
  });

  server.get('/interestByRegion', function(req, res) {
    console.log(req.query.keyword);
    googleTrends
      .interestByRegion({ keyword: req.query.keyword })
      .then(function(results) {
        console.log('results --> ', results);
        const parsedResult = JSON.parse(results);

        const finalResult = parsedResult.default.geoMapData.map(t => {
          return {
            id: t.geoName,
            value: t.value[0],
            coordinates: t.coordinates
          };
        });
        return res.send(finalResult);
      })
      .catch(function(err) {
        console.error('Oh no there was an error', err);
        return res.send(500);
      });
  });
};
