var AWS = require("aws-sdk");

// Set the region
AWS.config.update({
  region: "cn-northwest-1", //aws服务器所在地区编号    --  小编用的是aws宁夏服务器
  apiVersion: "2023-03-03",
  accessKeyId: "AKIAWZEUSLAMNNDM3Q2O", // keyID
  secretAccessKey: "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", //秘钥
});
//创建 aws 服务
var s3 = new AWS.S3();
export function AwsUpload(file) {
  var uploadParams = {
    Bucket: "boito-test", //桶名称
    Key: file.name, //图片名称
    Body: file, // file
    ACL: "public-read", //类型
    "Access-Control-Allow-Origin": "*", //策应请求头
  };
  var uploadFile = new Promise(function (resolve) {
    //做一些异步操作
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        resolve(data);
      }
    });
  });
  return uploadFile;
}
