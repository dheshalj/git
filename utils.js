const fs = require('fs')
const path = require('path')
const AWS = require("aws-sdk");
AWS.config.update({
  region: "ap-southeast-1",
});
const DynamoDB = new AWS.DynamoDB();

function isGit(repoDir, callback) {
    fs.readdir(repoDir, (error, results) => {
      let repos = results.filter((r) => {
        return r.substring(r.length - 3, r.length) == 'git'
      }, [])
      callback(repos)
    });
}

function combiner(username, repoNames) {
    var json = []
    for (let i = 0; i < repoNames.length; i++) {
        json.push(username + '/' + repoNames[i])
    }
    return json
}

function getRepos(callback) {
    const folders = fs.readdirSync(path.resolve(__dirname, 'repos'), { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
    let allRepos = []
    for (let i = 0; i < folders.length; i++) {
        if (folders[i].split('.')[folders[i].split('.').length - 1] != 'git') {
            isGit(path.resolve(__dirname, 'repos\\' + folders[i]), (repos) => {
                allRepos = allRepos.concat(combiner(folders[i].split('.'), repos))
                if (i == (folders.length - 1)) {
                    callback(allRepos)
                }
            })
        } else {
            allRepos = allRepos.concat(folders[i])
            if (i == (folders.length - 1)) {
                callback(allRepos)
            }
        }
    }
}

// -- AWS.DynamoDB -- //
// function addUser(username, password) {
//     const params = {
//       TableName: "GitUserData",
//       Item: {
//         username: { S: username },
//         password: { S: password },
//       },
//     };
  
//     DynamoDB.putItem(params, function(err) {
//       if (err) {
//         console.error("Unable to add user details", err);
//       } else {
//         console.log(`Added ${username} : ${password}`);
//       }
//     });
// }
// addUser("dheshalj", "passwordHere")

function getUsers() {
    const params = {
      TableName: "GitUserData",
    };
  
    DynamoDB.scan(params, function(err, data) {
      if (err) {
        console.error("Unable to find users", err);
        return []
      } else {
        return data.Items;
      }
    });
}
// getUsers() // [ { password: { S: 'passwordHere' }, username: { S: 'dheshalj' } } ]

// function getUser(username) {
//     const params = {
//       TableName: "GitUserData",
//       Key: {
//         username: { S: username },
//       },
//     };
  
//     DynamoDB.getItem(params, function(err, data) {
//       if (err) {
//         console.error("Unable to find user", err);
//       } else {
//         console.log("Found user", data.Item);
//       }
//     });
// }
// getUser("dheshalj") // Found user { password: { S: 'passwordHere' }, username: { S: 'dheshalj' } }

// function updateUserPassword(username, password) {
//     const params = {
//       TableName: "GitUserData",
//       Item: {
//         username: { S: username },
//         password: { S: password },
//       },
//       ReturnConsumedCapacity: "TOTAL",
//     };
  
//     DynamoDB.putItem(params, function(err) {
//       if (err) {
//         console.error("Unable to find user", err);
//       } else {
//         console.log(`Updated ${username} with ${password}%`);
//       }
//     });
// }
// updateUserPassword("dheshalj", "newPasswordHere")

// function deleteUser(username) {
//     const params = {
//       TableName: "GitUserData",
//       Key: {
//         username: { S: username },
//       },
//     };
  
//     DynamoDB.deleteItem(params, function(err) {
//       if (err) {
//         console.error("Unable to find user", err);
//       } else {
//         console.log(`Deleted ${username}`);
//       }
//     });
// }
// deleteUser("dheshalj")

function auth(username, password) {
    const cred = getUsers()
    for (let i = 0; i < cred.length; i++) {        
        if (cred[i].username.S == username && cred[i].password.S == password) {
            return true
        }
    }
    return false
}

module.exports = {
    getRepos,
    auth
}