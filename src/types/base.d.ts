import { CSSProperties } from 'react'

export interface AtComponentProps {
  /**
   * 自定义className
   *
   * @type {(string | string[] | { [key: string]: boolean })}
   * @memberof AtComponentProps
   */
  className?: string | string[] | { [key: string]: boolean }

  /**
   * 自定义Style
   * 
   * @type {(string | CSSProperties)}
   * @memberof AtComponentProps
   */
  customStyle?: string | CSSProperties
}

export default AtComponentProps