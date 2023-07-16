'use client'
import { ReactNode } from 'react'
import { RecoilRoot } from 'recoil'

type Props = {
  children: ReactNode
}

const Recoil = ({ children }: Props) => {
  return <RecoilRoot>{children}</RecoilRoot>
}

export default Recoil
