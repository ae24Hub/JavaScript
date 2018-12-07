
exports.info = async (req, res) => {

    const _devenvinfo = req.body.devenvinfo;
    const _opeinfo = req.body.opeinfo;
    const _backupinfo = req.body.backupinfo;

    connection = await db.beginTransaction();

    try{
        const company = req.app.get('device_company');
        _devenvinfo.company_id = company.id;
        await devenvinfo.insert(_devenvinfo, connection);
        const devenvinfo_id = await connection.lastInsertId();

        _opeinfo.devenvinfo_id = devenvinfo_id;
        await opeinfo.insert(_opeinfo, connection);

        _backupinfo.devenvinfo_id = devenvinfo_id;
        await backupinfo.insert(_backupinfo, connection);

        await connection.commit();

        res.json({messages: ['Saved.'.i18n(req)]});

    }catch(e){
        console.log(e);

        if(connection){
            connection.rollback();
        }

        res.json({messages: ['Error.'.i18n(req)]});
    }


};



exports.alert = async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        validate(from).and(to).invoke(404);

        const data = await devenvinfo.selectByAlert({from:from,to:to});
        res.json({
            messages: ['OK'.i18n(req)],
            users: data
        });
    } catch (e) {
        console.error(e);

        if (e.statusCode) {
            res.statusCode = e.statusCode;
            res.json(e.messages && e.messages.length ? {messages: e.messages} : {});
            return;
        }
    }
};