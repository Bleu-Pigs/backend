const RESTify = require("restify");
const Sequelize = require("sequelize");
const Crypto = require("crypto");
const assert = require("assert");

const PostgreSQL = new Sequelize(`postgresql://${process.env.postgresUsername}:${process.env.postgresPassword}@${process.env.postgresUrl}:5432/${process.env.accountsDatabase}`);
const DataTypes = Sequelize.DataTypes;
const Models = Sequelize.models;

//// define Models
// Model User
Sequelize.define("User", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    authenticationString: {
        type: DataTypes.STRING(256),
        allowNull: false      
    },
    authorizationTokens: {
        type: DataTypes.JSONB,
        allowNull: false
    }
}, {
    freezeTableName: true
});

//// HttpServer
const HttpServer = RESTify.createServer({
    name: "accounts"
});
HttpServer.use(RESTify.plugins.jsonBodyParser());
HttpServer.use(RESTify.plugins.urlEncodedBodyParser());

HttpServer.post("/account/register", function(request, response, proceed) {
    if (!request.getContentType("application/json")) {
        response.status(500);
        return response.send({
            success: false,
            response: `unsupported ContentType ${request.contentType}`
        });
    };

    (async function() {
        if (await Models.User.findOne({where: {userName: request.body.userName}})) {
            response.status(500);
            return response.send({
                success: false,
                response: `${request.body.userName} already exists`
            });
        }

        const authenticationStringHash = Crypto.createHmac("sha512", process.env.hmacSecret).update(request.body.authenticationString).digest("hex");
        const newUser = await Sequelize.models.create({
            userName: request.body.userName,
            authenticationString: authenticationString,
            authenticationTokens: {}
        });
        response.status(200);
        response.send({
            success: true
        });
        proceed();
    })();
}); //"DO.NOT.SHARE.WITH.ANYONE|" + Crypto.createHmac("sha512", process.env.hmacSecret).update(Crypto.randomBytes(64)).digest("hex")
HttpServer.post("/account/login", function(request, response, proceed) {

});
HttpServer.get("/account/logout", function(request, response, proceed) {

});
HttpServer.get("/account/authorized", function(request, response, proceed) {

});

HttpServer.listen(8080, function() {
    console.log("ready");
});