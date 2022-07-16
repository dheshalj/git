const fs = require('fs')
const path = require('path')
const cred = require('./users.json')

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

function auth(username, password) {
    for (let i = 0; i < cred.length; i++) {        
        if (cred[i].username == username && cred[i].password == password) {
            return true
        }
    }
    return false
}

module.exports = {
    getRepos,
    auth
}