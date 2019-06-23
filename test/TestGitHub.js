const FileSystem = require('fs');
const path = require("path");

const chai = require('chai');
chai.use(require('chai-as-promised'));
const {assert} = chai;

const credentials = JSON.parse(FileSystem.readFileSync(path.resolve(__dirname, "../resources/credentials.json"), "UTF8"));
const github = require('../src/github.js')(credentials.github);
const projects = require('../src/projects.js');

// Individual Tests
const commitsTest = require('../test/TestCommits.js')(assert, github);
const licenseTest = require('../test/TestLicense.js')(assert, github);
const tagsTest = require('../test/TestTags.js')(assert, github);
const comparisonTest = require('../test/TestComparison.js')(assert, github);

var testDirectory = path.resolve(__dirname, "../testRepository/repo/master");
var testBuilds = {
    latest: 1,
    last_successful: 1,
    1: {
        id: 1,
        sha: "74a46798d594e93ca245bd245cf6fc0ec373a149",
        date: "09 Jun 2019 (12:32:03)",
        timestamp: 20190609123203,
        message: "Test Commit",
        author: "Nobody",
        status: "SUCCESS"
    }
}

describe("GitHub Connectivity Test", () => {
    before(() => {
        return new Promise((resolve, reject) => {
            FileSystem.access(testDirectory, FileSystem.constants.F_OK | FileSystem.constants.R_OK | FileSystem.constants.W_OK, (err) => {
                if (err) {
                    FileSystem.mkdir(testDirectory, {recursive: true}, (e) => {
                        if (e) reject(e);
                        else FileSystem.writeFile(testDirectory + "/builds.json", JSON.stringify(testBuilds), "utf8", resolve);
                    });
                }
                else resolve();
            });
        });
    });

    describe("Commits", commitsTest);
    describe("License", licenseTest);
    describe("Tags", tagsTest);
    describe("Update Checker", comparisonTest);

    after(cleanup);
});

function cleanup() {
    let file = path.resolve(__dirname, "../testRepository");

    if (!FileSystem.existsSync(file)) return Promise.resolve();
    else return projects.clearFolder(file);
}
