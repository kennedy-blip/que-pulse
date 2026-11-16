import type { VercelRequest, VercelResponse } from '@vercel/node'
import { process } from './_lib/queue'

export default function handler(req:VercelRequest,res:VercelResponse){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'})}
  try{const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};return res.status(200).json(process(body))}
  catch{return res.status(400).json({error:'Invalid worker configuration'})}
}
