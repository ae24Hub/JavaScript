const floors = require('../sql/floors');
const validator = require('../lib/validator');
const validate = validator.validate;
const validateSort = validator.validateSort;

/**
 * フロアリスト取得
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.list = async (req, res) => {
  try {
    const company = req.app.get('company');
    const sort = req.query.sort;

    // ソートパラメータチェック
    validateSort(sort, ['id', 'name'], 'An invalid request has been sent.'.i18n(req)).invoke(400);

    // フロアリスト取得
    const entities = (await floors.selectList({company_id: company.id}, sort)).map(floor => {
      return {
        id: floor.id,
        name: floor.name
      }
    });

    res.json({messages: [], result: {floors: entities}});

  } catch (e) {
    console.error(e);

    if (e.statusCode) {
      res.statusCode = e.statusCode;
      res.json(e.messages && e.messages.length ? {messages: e.messages} : {});
      return;
    }

    res.statusCode = 500;
    res.json({messages: ['Failed to retrieve data.'.i18n(req)]});
  }
};

/**
 * フロア取得
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.get = async (req, res) => {
  try {
    const company = req.app.get('company');
    const id = req.params.id;

    // IDがなければNot Found
    validate(id, undefined).invoke(404);

    // フロア取得
    const entity = (await floors.selectById({company_id: company.id, id}))[0];

    // フロアが存在しなければ404
    validate(entity, undefined).invoke(404);

    res.json({
      messages: [],
      result: {
        id: entity.id,
        name: entity.name,
        map: entity.map
      }
    });

  } catch (e) {
    console.error(e);

    if (e.statusCode) {
      res.statusCode = e.statusCode;
      res.json(e.messages && e.messages.length ? {messages: e.messages} : {});
      return;
    }

    res.statusCode = 500;
    res.json({messages: ['Failed to retrieve data.'.i18n(req)]});
  }
};
