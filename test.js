import "https://deno.land/x/dotenv/load.ts";
import { assert, fail, assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { App } from './mod.js'
const zip = './fixtures/app.zip'

const accessToken = Deno.env.get("ACCESS_TOKEN")
const appID       = Deno.env.get("APP_ID")
const name        = Deno.env.get("APP_NAME")
const test        = Deno.test

test("Should exist", ()=> {
  assert(App)
})

test("Should expose create, find, list methods", ()=> {
  assert(App.create)
  assert(App.find)
  assert(App.list)
})

test("should have builds, deploy, destroy, and logs methods", ()=> {
  const app = App({
    accessToken,
    name,
    zip
  })
  assert(app.builds)
  assert(app.deploy)
  assert(app.destroy)
  assert(app.logs)
})

test("should have env with get, set, and destroy methods", ()=> {
  const app = App({
    accessToken,
    appID,
    name,
    url,
  })
  const env = app.env
  assert(env.get)
  assert(env.set)
  assert(env.destroy)
})

test("should have staticAssets with get, set, and destroy methods", ()=> {
  const app = App({
    accessToken,
    appID,
    name,
    url,
  })
  const staticAssets = app.staticAssets
  assert(staticAssets.get)
  assert(staticAssets.set)
  assert(staticAssets.destroy)
})
