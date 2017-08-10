module.exports = {
    port:8080,
    session:{
        secret:"ejsblog",
        key:"ejsblog",
        maxAge:2592000000
    },
    mongodb:"mongodb://localhost:27017/myejsblog"
};