const { exec } = require('child_process')
const os = require('os')

const args = process.argv.slice(2)
if (args.length === 0) {
    console.error('Please provide a base name for the folder and files.')
    process.exit(1)
}

const baseName = args[0]
const platform = os.platform()

let command

if (platform === 'win32') {
    command = `npm run generate:route:win ${baseName}`
} else {
    command = `npm run generate:route:unix ${baseName}`
}

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing script: ${error.message}`)
        return
    }

    if (stderr) {
        console.error(`Script stderr: ${stderr}`)
        return
    }

    console.log(stdout)
})
