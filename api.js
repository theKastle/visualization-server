const googleTrends = require('google-trends-api');
const { map } = require('p-iteration');
const _ = require('lodash');

const mapToParamsToQuery = query => {
  console.log(query);

  const mappedQuery = {};

  Object.keys(query).forEach(key => {
    if (query[key]) {
      mappedQuery[key] =
        key === 'startDate' || key === 'endDate'
          ? new Date(+query[key])
          : query[key];
    }
  });

  console.log(mappedQuery);
  return mappedQuery;
};

module.exports.setUp = function(server) {
  server.get('/relatedTopics', function(req, res) {
    googleTrends
      .relatedTopics(mapToParamsToQuery(req.query))
      .then(function(results) {
        const parsedResult = JSON.parse(results);

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
    googleTrends
      .relatedQueries(mapToParamsToQuery(req.query))
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
    googleTrends
      .interestByRegion(mapToParamsToQuery(req.query))
      .then(function(results) {
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

  server.get('/interestByRegionOverTime', function(req, res) {
    const times = [
      {
        startTime: '2014-02-01',
        endTime: '2014-08-01'
      },
      {
        startTime: '2014-08-01',
        endTime: '2015-02-01'
      },
      {
        startTime: '2015-02-01',
        endTime: '2015-08-01'
      },
      {
        startTime: '2015-08-01',
        endTime: '2016-02-01'
      },
      {
        startTime: '2016-02-01',
        endTime: '2016-08-01'
      },
      {
        startTime: '2016-08-01',
        endTime: '2017-02-01'
      },
      {
        startTime: '2017-02-01',
        endTime: '2017-08-01'
      },
      {
        startTime: '2017-08-01',
        endTime: '2018-02-01'
      },
      {
        startTime: '2018-02-01',
        endTime: '2018-08-01'
      }
    ];

    const countries = [
      'United States',
      'Vietnam',
      'South Korea',
      'United Kingdom',
      'Canada',
      'Thailand',
      'Japan',
      'Germany',
      'France',
      'Sweden',
      'Israel',
      'Netherlands',
      'Singapore',
      'Hong Kong',
      'Australia',
      'Italy',
      'Taiwan',
      'Philippines',
      'Austria',
      'Belgium',
      'Norway',
      'Nepal',
      'Haiti',
      'India',
      'Denmark',
      'Spain',
      'Russia',
      'Greece',
      'New Zealand',
      'Portugal',
      'Czechia',
      'Malaysia',
      'Poland',
      'Switzerland',
      'Laos',
      'Cambodia',
      'Brazil',
      'Finland',
      'Turkey',
      'Egypt',
      'China',
      'Macau',
      'Mexico',
      'Cuba',
      'Iran',
      'Venezuela',
      'Argentina',
      'Ireland',
      'Peru'
    ];

    getInterestByRegionOverTime(times, req.query.keyword)
      .then(function(results) {
        const finalResult = {};

        results.forEach(result => {
          const response = result.response.default.geoMapData
            .map(t => {
              return {
                id: t.geoName,
                value: t.value[0],
                coordinates: t.coordinates
              };
            })
            .filter(
              region => region.value !== 0 && countries.includes(region.id)
            );

          countries.forEach(country => {
            if (!response.map(r => r.id).includes(country)) {
              response.push({
                id: country,
                value: 0
              });
            }
          });

          finalResult[result.timeLabel] = _.orderBy(response, ['id'], ['asc']);
        });

        return res.send(finalResult);
      })
      .catch(function(err) {
        console.error('Oh no there was an error', err);
        return res.send(500);
      });
  });
};

const getInterestByRegionOverTime = (times, keyword) => {
  return map(times, async time => {
    const response = await googleTrends.interestByRegion({
      keyword: keyword,
      resolution: 'COUNTRY',
      startTime: new Date(time.startTime),
      endTime: new Date(time.endTime),
      category: 0
    });

    return {
      timeLabel: time.endTime,
      response: JSON.parse(response)
    };
  });
};
