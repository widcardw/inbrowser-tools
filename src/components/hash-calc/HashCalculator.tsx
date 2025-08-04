import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { Md5 } from 'ts-md5'
import CopyBtn from '../copy/ClipboardCopy'

import './index.css'
import '~/styles/tools-common.css'

const HashCalculator: Component = () => {
  const [inputText, setInputText] = createSignal('')
  const [alg, setAlg] = createSignal('md5')
  const [outputStr, setOutputStr] = createSignal('Result')

  async function calcHash(text: string, algorithm: string) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      let hashBuffer: ArrayBuffer | null = null
      switch (algorithm) {
        case 'md5':
          return setOutputStr(Md5.hashStr(text))
        case 'sha1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data)
          break
        case 'sha256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data)
          break
        case 'sha512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data)
          break
        default:
          setOutputStr('Unsupported algorithm')
          return
      }
      if (hashBuffer) {
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        setOutputStr(hashHex)
      }
    } catch (error) {
      setOutputStr(`Error: ${error}`)
    }
  }

  return (
    <div class="hash-calculator">
      <div class="input-group">
        <label for="textInput">Input Text:</label>
        <textarea
          id="textInput"
          class="text-input"
          placeholder="Enter text to hash"
          value={inputText()}
          onInput={(e) => {
            setInputText(e.target.value)
            calcHash(inputText(), alg())
          }}
        />
      </div>

      <div class="algorithm-selector">
        <label for="hashAlgorithm">Hash Algorithm:</label>
        <select
          id="hashAlgorithm"
          onChange={(e) => {
            setAlg((e.target as HTMLSelectElement).value)
            calcHash(inputText(), alg())
          }}
        >
          <option value="md5">MD5</option>
          <option value="sha1">SHA-1</option>
          <option value="sha256">SHA-256</option>
          <option value="sha512">SHA-512</option>
        </select>
      </div>

      <div class="result-group">
        <label for="hashResult" class="flex items-center">
          <span class="flex-1">Hash Result:</span>
          <CopyBtn textToCopy={outputStr()}>Copy</CopyBtn>
        </label>
        <textarea disabled value={outputStr()} />
      </div>

      <button onClick={() => calcHash(inputText(), alg())}>
        Calculate Hash
      </button>
    </div>
  )
}

export default HashCalculator
