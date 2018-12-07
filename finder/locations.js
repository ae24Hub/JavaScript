const db = require('../lib/db');

/**
 * 位置情報取得
 * @param params
 * @param connection
 * @returns {Promise}
 */
exports.selectByUserId = (params = {}, connection = db.writable) => connection.query(`
  select
    *
  from
    locations
  where
    user_id = :user_id
    and !deleted
`, params);

/**
 * 位置情報登録
 * @param params
 * @param connection
 * @returns {Promise}
 */
exports.insert = (params = {}, connection = db.writable) => connection.query(`
  insert into locations
  (
    user_id,
    floor_id,
    area_id,
    x,
    y,
    latitude,
    longitude,
    tracked_at
  )
  values
  (
    :user_id,
    :floor_id,
    :area_id,
    :x,
    :y,
    :latitude,
    :longitude,
    :tracked_at
  )
`, params);

/**
 * 位置情報更新
 * @param params
 * @param connection
 * @returns {Promise}
 */
exports.update = (params = {}, connection = db.writable) => connection.query(`
  update
    locations
  set
    floor_id = :floor_id,
    area_id = :area_id,
    x = :x,
    y = :y,
    latitude = :latitude,
    longitude = :longitude,
    tracked_at = :tracked_at
  where
    user_id = :user_id
    and !deleted
`, params);
