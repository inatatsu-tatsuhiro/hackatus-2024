/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC, useEffect, useState } from 'react'
import {
  Address,
  KeyGenerator,
  MetadataSearchCriteria,
  RepositoryFactoryHttp
} from 'symbol-sdk'
import { Config } from '../../utils/Config'
import { collection, getDocs, query } from '@firebase/firestore'
import { db } from '../../utils/Firebase'
import { useParams } from 'react-router'
import { getActivePublicKey } from 'sss-module'
import styled from '@emotion/styled'

interface SSSWindow extends Window {
  SSS: {
    setEncryptedMessage: (message: string, publickKey: string) => void
    requestSignDecription: () => Promise<string>
  }
}
declare const window: SSSWindow

const Page: FC = () => {
  const [hankoImage, setHankoImage] = useState(new Image())
  const { addr } = useParams()
  const pub = getActivePublicKey()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const f = async () => {
      const path = `/apostille/files/${addr}`

      const address = Address.createFromRawAddress(`${addr}`)

      const repo = new RepositoryFactoryHttp(Config.nodeUrl)

      const metaRepo = repo.createMetadataRepository()
      const mdInfo: MetadataSearchCriteria = {
        sourceAddress: address,
        scopedMetadataKey: KeyGenerator.generateUInt64Key('address').toHex()
      }
      const md = await metaRepo.search(mdInfo).toPromise()

      if (md === undefined) return

      const metadata = md.data[0]

      setShowButton(metadata.metadataEntry.value === getActivePublicKey())

      const snapShot = query(collection(db, path))

      const docSnaps = await getDocs(snapShot)
      const data = docSnaps.docs.map((doc) => doc.data())[0]

      const img = new Image()
      img.src = data.file
      setHankoImage(img)
    }
    f()
  }, [addr, pub])

  const audit = async () => {
    const path = `/apostille/stamped/${addr}`
    console.log(path)

    const snapShot = query(collection(db, path))

    const docSnaps = await getDocs(snapShot)
    const data = docSnaps.docs.map((doc) => doc.data())[0]

    console.log(data)

    const payload = data.stamped
    const sender = data.sender

    window.SSS.setEncryptedMessage(payload, sender)
    const tmp = await window.SSS.requestSignDecription()

    const hImg = new Image()
    hImg.src = tmp
    setHankoImage(hImg)
    setShowButton(false)
  }

  return (
    <Root>
      <img src={hankoImage.src} />
      {showButton && <Button onClick={audit}>SHOW SIGN</Button>}
    </Root>
  )
}

export default Page

// const sleep = async () => {
//   return new Promise((resolve) => setTimeout(resolve, 1000))
// }
const Button = styled('button')({
  width: '120px',
  height: '48px',
  border: '1px solid #888',
  borderRadius: '8px',
  background: '#888'
})

const Root = styled('div')({
  display: 'flex',
  width: '600px',
  flexDirection: 'column',
  gap: '16px'
})
