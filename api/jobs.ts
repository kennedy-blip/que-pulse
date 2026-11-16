import type { VercelRequest, VercelResponse } from '@vercel/node'
import { enqueue, replay, snapshot } from './_lib/queue'

export default function handler(req:VercelRequest,res:VercelResponse){
  res.setHeader('Cache-Control','no-store')
  if(req.method==='GET')return res.status(200).json(snapshot())
  if(req.method==='POST'){
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{}
    if(typeof body.name!=='string'||!body.name.trim())return res.status(400).json({error:'A job name is required'})
    if(body.payload!==undefined&&(typeof body.payload!=='object'||body.payload===null||Array.isArray(body.payload)))return res.status(400).json({error:'Payload must be a JSON object'})
    return res.status(201).json(enqueue(body))
  }
  if(req.method==='PATCH'){
    const id=String(req.query.id||'');if(!id)return res.status(400).json({error:'Job id is required'})
    const job=replay(id);return job?res.status(200).json(job):res.status(404).json({error:'Replayable job not found'})
  }
  res.setHeader('Allow','GET, POST, PATCH');return res.status(405).json({error:'Method not allowed'})
}
