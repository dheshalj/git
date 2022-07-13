const { resolve } = require('path') 
const gitjs = require('./gitdheshal')

const git = new (require('node-git-server'))(resolve(__dirname, 'repos'), {
    autoCreate: true,
    authenticate: ({ type, repo, user }, next) => {
        user((username, password) => {
            if (gitjs.auth(username, password)) {
                next()
            } else {
                next('Wrong Password')
            }
        })
    }
})

git.on('push', (push) => {
    console.log(`push ${push.repo}/${push.commit} (${push.branch})`)
    push.accept()
})

git.on('fetch', (fetch) => {
    console.log(`fetch ${fetch.commit}`)
    fetch.accept()
})

// CalGit.create('dheshalj/repoName', () => {
//     console.log('Created')
// })

// CalGit.exists('dheshalj/repoName.git', (cb) => {
//     console.log(cb)
// })

// gitjs.getRepos((list) => {
//     console.log(list)
// })

git.listen(process.env.PORT || 8080, () => {
    console.log(`CalGit running at http://localhost:${process.env.PORT || 8080}`)
})