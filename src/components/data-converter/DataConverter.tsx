import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import { load as parseYaml, dump as stringifyYaml } from 'js-yaml'
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import CopyBtn from '../copy/ClipboardCopy'

import '~/styles/tools-common.css'
import './styles.css'

type Format = 'json' | 'csv' | 'yaml' | 'toml'

// =============== CSV 解析 / 序列化 ===============

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length === 0) return []

  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          current += ch
        }
      } else {
        if (ch === '"') {
          inQuotes = true
        } else if (ch === ',') {
          result.push(current.trim())
          current = ''
        } else {
          current += ch
        }
      }
    }
    result.push(current.trim())
    return result
  }

  const headers = parseLine(lines[0]).map((h) => h.replace(/^"(.*)"$/, '$1'))
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = parseLine(line)
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = idx < values.length ? values[idx].replace(/^"(.*)"$/, '$1') : ''
    })
    rows.push(row)
  }

  return rows
}

function stringifyCSV(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('CSV 输出需要数组类型数据')
  }

  const escapeField = (val: unknown): string => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const keys = [...new Set(data.flatMap(Object.keys))]
  const lines: string[] = [keys.map((k) => escapeField(k)).join(',')]

  for (const row of data) {
    lines.push(keys.map((k) => escapeField(row[k])).join(','))
  }

  return lines.join('\n')
}

// =============== 解析与序列化统一入口 ===============

function parseInput(text: string, format: Format): unknown {
  switch (format) {
    case 'json':
      return JSON.parse(text)
    case 'csv':
      return parseCSV(text)
    case 'yaml':
      return parseYaml(text)
    case 'toml':
      return parseToml(text)
  }
}

function stringifyOutput(data: unknown, format: Format): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2)
    case 'csv':
      return stringifyCSV(data)
    case 'yaml':
      return stringifyYaml(data, { indent: 2, lineWidth: 120, noRefs: true })
    case 'toml':
      return stringifyToml(data as Record<string, unknown>)
  }
}

// =============== 示例数据 ===============

const EXAMPLES: Record<Format, string> = {
  json: JSON.stringify(
    [
      { name: 'Alice', age: 30, city: 'New York', active: true },
      { name: 'Bob', age: 25, city: 'London', active: false },
      { name: 'Charlie', age: 35, city: 'Tokyo', active: true },
    ],
    null,
    2,
  ),

  csv: `name,age,city,active
Alice,30,New York,true
Bob,25,London,false
Charlie,35,Tokyo,true`,

  yaml: `people:
  - name: Alice
    age: 30
    city: New York
    active: true
  - name: Bob
    age: 25
    city: London
    active: false
  - name: Charlie
    age: 35
    city: Tokyo
    active: true
settings:
  theme: dark
  lang: zh-CN`,

  toml: `[server]
host = "localhost"
port = 8080

[database]
name = "myapp"
user = "admin"
password = "secret"

[features]
enable_logging = true
max_connections = 100`,
}

const FORMAT_LABELS: Record<Format, string> = {
  json: 'JSON',
  csv: 'CSV',
  yaml: 'YAML',
  toml: 'TOML',
}

const FORMAT_OPTIONS: Format[] = ['json', 'csv', 'yaml', 'toml']

// =============== 组件 ===============

const DataConverter: Component = () => {
  const [inputText, setInputText] = createSignal('')
  const [outputText, setOutputText] = createSignal('')
  const [outputError, setOutputError] = createSignal(false)
  const [inputFormat, setInputFormat] = createSignal<Format>('json')
  const [outputFormat, setOutputFormat] = createSignal<Format>('yaml')
  const [converting, setConverting] = createSignal(false)

  function convert() {
    if (converting()) return
    setConverting(true)

    try {
      const text = inputText().trim()
      if (!text) {
        setOutputText('请输入要转换的数据')
        setOutputError(true)
        return
      }

      const inFmt = inputFormat()
      const outFmt = outputFormat()

      if (inFmt === outFmt) {
        setOutputText('输入和输出格式相同，无需转换')
        setOutputError(true)
        return
      }

      const parsed = parseInput(text, inFmt)
      const result = stringifyOutput(parsed, outFmt)

      setOutputText(result)
      setOutputError(false)
    } catch (error) {
      setOutputText(`转换错误: ${(error as Error).message || error}`)
      setOutputError(true)
    } finally {
      setConverting(false)
    }
  }

  function swapFormats() {
    const inFmt = inputFormat()
    const outFmt = outputFormat()

    setInputFormat(outFmt)
    setOutputFormat(inFmt)

    // Also swap text content if output is valid
    const outVal = outputText()
    if (outVal && !outputError()) {
      setInputText(outVal)
      setOutputText('')
      setOutputError(false)
    }
  }

  function loadExample(format: Format) {
    setInputFormat(format)
    setInputText(EXAMPLES[format])
    setOutputText('')
    setOutputError(false)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      convert()
    }
  }

  return (
    <div class="container">
      <h1>数据格式转换</h1>
      <p class="description">
        在 JSON、CSV、YAML、TOML 四种数据格式之间互相转换。所有数据仅在浏览器中处理，不会上传到服务器。
      </p>

      <div class="format-selectors">
        <div class="format-selector">
          <label for="input-format">输入格式：</label>
          <select
            id="input-format"
            class="select-input"
            value={inputFormat()}
            onChange={(e) => setInputFormat((e.target as HTMLSelectElement).value as Format)}
          >
            {FORMAT_OPTIONS.map((fmt) => (
              <option value={fmt}>{FORMAT_LABELS[fmt]}</option>
            ))}
          </select>
        </div>

        <button class="btn swap-btn" onClick={swapFormats} title="交换输入输出格式">
          <span class="i-ri-arrow-left-right-line" />
        </button>

        <div class="format-selector">
          <label for="output-format">输出格式：</label>
          <select
            id="output-format"
            class="select-input"
            value={outputFormat()}
            onChange={(e) => setOutputFormat((e.target as HTMLSelectElement).value as Format)}
          >
            {FORMAT_OPTIONS.map((fmt) => (
              <option value={fmt}>{FORMAT_LABELS[fmt]}</option>
            ))}
          </select>
        </div>
      </div>

      <div class="input-section">
        <div class="section-header">
          <label for="input-text">输入数据：</label>
          <div class="examples">
            <p>示例：</p>
            {FORMAT_OPTIONS.map((fmt) => (
              <button class="btn example-btn" onClick={() => loadExample(fmt)}>
                {FORMAT_LABELS[fmt]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="input-text"
          class="text-input"
          placeholder="在此粘贴要转换的数据..."
          rows="8"
          value={inputText()}
          onInput={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div class="buttons">
        <button class="btn primary" onClick={convert} disabled={converting()}>
          {converting() ? '转换中...' : '转换'}
        </button>
        <CopyBtn class="btn" textToCopy={outputText()}>
          复制结果
        </CopyBtn>
        <button
          class="btn"
          onClick={() => {
            setInputText('')
            setOutputText('')
            setOutputError(false)
          }}
        >
          清空
        </button>
      </div>

      <div class="output-section">
        <label for="output-text">转换结果：</label>
        <pre
          id="output-text"
          class="output"
          classList={{ error: outputError() }}
        >
          {outputText() || '等待转换...'}
        </pre>
      </div>

      <div class="notes">
        <h3>说明：</h3>
        <ul>
          <li>CSV 转换只支持表格型数据（对象数组或数组的数组）。</li>
          <li>所有数据仅在浏览器中处理，不会上传到任何服务器。</li>
        </ul>
      </div>
    </div>
  )
}

export default DataConverter
