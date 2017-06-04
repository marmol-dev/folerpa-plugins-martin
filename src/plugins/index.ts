import * as express from 'express'
import { Router } from 'express';
import * as glob from 'glob'
import {join, basename, dirname} from 'path'

export interface Plugins {
    [path : string] : Router
}

const plugins : Plugins = {}

glob.sync(join(__dirname, '*', 'index.js')).forEach(path => {
    const folderName = basename(dirname(path))
    plugins[folderName] = require(path).default
})

console.log('plugins', plugins)

export default plugins



