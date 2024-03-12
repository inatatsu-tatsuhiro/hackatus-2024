import { FC, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Image as KImage } from 'react-konva'
import { ApostilleFacade, HashType } from '@sss-symbol/apostille'
import { Config } from '../../utils/Config'
import Konva from 'konva'
import {
  getActivePublicKey,
  requestSignEncription,
  requestSignWithCosignatories,
  setMessage,
  setTransaction
} from 'sss-module'
import { RepositoryFactoryHttp } from 'symbol-sdk'
import { db } from '../../utils/Firebase'
import { collection, doc, setDoc } from '@firebase/firestore'
import styled from '@emotion/styled'
import { useDropzone } from 'react-dropzone'

const Page: FC = () => {
  const [file, setFile] = useState<File>(new File([], ''))
  const [fileImage, setFileImage] = useState<HTMLImageElement>(new Image())
  const [hankoFileImage, setHankoFileImage] = useState<HTMLImageElement>(
    new Image()
  )
  const [positionX, setPositionX] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [address, setAddress] = useState('')
  const stageRef = useRef<Konva.Stage>(null)
  const imageRef = useRef<Konva.Stage>(null)

  const onDrop = useCallback((file: File[]) => {
    const img = new Image()
    img.src = URL.createObjectURL(file[0])
    setFileImage(img)
    setFile(file[0])
  }, [])
  const onDrop2 = useCallback((file: File[]) => {
    const img = new Image()
    img.src = URL.createObjectURL(file[0])
    setHankoFileImage(img)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({ onDrop })
  const hankoDropZone = useDropzone({ onDrop: onDrop2 })

  const save = async () => {
    if (imageRef.current === null || stageRef.current === null) return
    const data = imageRef.current.toDataURL()
    const stampedData = stageRef.current.toDataURL()
    const NODE = Config.nodeUrl
    const info = await ApostilleFacade.getNetworkInfomation(NODE)

    setMessage(stampedData, address)

    const msg = await requestSignEncription()

    await sleep()

    const option = {
      metadata: {
        address
      },
      isOwner: false
    }

    const facade = new ApostilleFacade(HashType.SHA256, info)
    const userPublicKey = getActivePublicKey()

    const apostilleTransaction = facade.createApostille(
      data,
      file.name,
      userPublicKey,
      option
    )
    const transaction = apostilleTransaction.createTransaction()
    const cosignatories = apostilleTransaction.getCosignatories()

    setTransaction(transaction)

    const signedTx = await requestSignWithCosignatories(cosignatories)
    const repo = new RepositoryFactoryHttp(Config.nodeUrl)
    const txRepo = repo.createTransactionRepository()
    await txRepo.announce(signedTx).toPromise()

    const key = apostilleTransaction.apostilleAccount.account.address.plain()

    const fileRef = doc(collection(db, `/apostille/files/${key}`))
    setDoc(fileRef, {
      file: data
    })
    const stampedRef = doc(collection(db, `/apostille/stamped/${key}`))
    setDoc(stampedRef, {
      stamped: msg.payload,
      sender: getActivePublicKey()
    })
  }

  const setX = (x: string) => {
    setPositionX(Number(x))
  }
  const setY = (y: string) => {
    setPositionY(Number(y))
  }

  return (
    <Root>
      <div>
        <div>X</div>
        <input
          type="range"
          onChange={(e) => setX(e.target.value)}
          min={0}
          max={500}
        />
        <div>Y</div>
        <input
          type="range"
          onChange={(e) => setY(e.target.value)}
          min={0}
          max={500}
        />
        <div>IMAGE</div>
        {fileImage.src === '' ? (
          <DZ {...getRootProps()}>
            <input {...getInputProps()} />
            <div>画像ファイルを選択(500 * 500 推奨)</div>
          </DZ>
        ) : (
          <Button onClick={() => setFileImage(new Image())}>CLEAR</Button>
        )}
        <div>HANKO</div>
        {hankoFileImage.src === '' ? (
          <DZ {...hankoDropZone.getRootProps()}>
            <input {...hankoDropZone.getInputProps()} />
            <div>画像ファイルを選択(50 * 50 推奨)</div>
          </DZ>
        ) : (
          <Button onClick={() => setHankoFileImage(new Image())}>CLEAR</Button>
        )}

        <div>送信先公開鍵</div>
        <TextField onChange={(e) => setAddress(e.target.value)} />
      </div>
      <Column>
        <div>プレビュー</div>
        <StageWrapper>
          <Stage width={500} height={500} ref={stageRef}>
            <Layer>
              <KImage
                image={fileImage}
                width={fileImage.width}
                height={fileImage.height}
              />
            </Layer>
            <Layer x={positionX} y={positionY}>
              <KImage image={hankoFileImage} width={50} height={50} />
            </Layer>
          </Stage>
        </StageWrapper>
        <Hide>
          <Stage
            width={fileImage.width}
            height={fileImage.height}
            ref={imageRef}>
            <Layer>
              <KImage
                image={fileImage}
                width={fileImage.width}
                height={fileImage.height}
              />
            </Layer>
          </Stage>
        </Hide>
        <Button onClick={save}>SAVE</Button>
      </Column>
    </Root>
  )
}

export default Page

const sleep = async () => {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

const Root = styled('div')({
  display: 'flex',
  gap: '16px',
  width: '100vw',
  height: '100vh',
  placeItems: 'center',
  placeContent: 'center'
})
const Column = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
})
const Hide = styled('div')({
  display: 'none'
})

const DZ = styled('div')({
  width: '400px',
  height: '200px',
  border: '1px solid #444',
  borderRadius: '8px',
  display: 'flex',
  placeItems: 'center',
  placeContent: 'center'
})

const TextField = styled('input')({
  height: '48px',
  width: 'calc(100% - 16px)',
  fontSize: '16px',
  margin: '0px',
  padding: '0px',
  paddingLeft: '16px'
})

const Button = styled('button')({
  width: '120px',
  height: '48px',
  border: '1px solid #888',
  borderRadius: '8px',
  background: '#888'
})

const StageWrapper = styled('div')({
  width: '500px',
  height: '500px',
  background: '#ABABAB'
})
