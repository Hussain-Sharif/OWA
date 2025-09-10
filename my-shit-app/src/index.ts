import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getGithubRepoInfo } from './routes/getGithubRepoInfo'
import { Bindings, GithubBadResponseType, GithubGoodResponseType } from './libs/types'
import { StatusCode } from 'hono/utils/http-status'


//CONFIG AND APP readiness
const app = new Hono<{Bindings:Bindings}>()


// CORS 
app.use('/*', cors())


//Routes 
app.get('/', async(c) => {
  // console.log('Environment check:', {
  //   username: c.env.SHARIF_USERNAME,
  //   reponame: c.env.SHARIF_REPONAME,
  //   pat: c.env.SHARIF_PAT ? 'SET' : 'UNDEFINED'
  // })
  // return c.json({
  //   username: !!c.env.SHARIF_USERNAME,
  //   reponame: !!c.env.SHARIF_REPONAME,
  //   pat: !!c.env.SHARIF_PAT
  // })
  console.log(c.env)
  const response:GithubGoodResponseType|GithubBadResponseType=await getGithubRepoInfo(c.env.SHARIF_USERNAME,c.env.SHARIF_REPONAME,c.env.SHARIF_PAT)
  c.status(response.statusCode as StatusCode)
  return c.json({response})
})

app.notFound((c)=>{
  return c.text('Not Found for the path '+c.req.path)
})

app.onError((error,c)=>{
  c.status(500)
  return c.text('Error for the path '+c.req.path+ ' Error Msg: '+error.message)
})

export default app
