/** Strip HTML tags and return trimmed plain text */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.innerHTML = html
    return (div.textContent || div.innerText || '').trim()
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Parse CQ segment fields from stored document (supports segment* fields and subQuestions JSON) */
export function parseCqSegmentsFromItem(item: Record<string, any>) {
  const segments = {
    segmentK: String(item.segmentK || ''),
    segmentKh: String(item.segmentKh || ''),
    segmentG: String(item.segmentG || ''),
    segmentGh: String(item.segmentGh || ''),
    solutionK: String(item.solutionK || ''),
    solutionKh: String(item.solutionKh || ''),
    solutionG: String(item.solutionG || ''),
    solutionGh: String(item.solutionGh || ''),
  }

  const splitQuestionAndAnswer = (text: string) => {
    if (!text) return { question: '', answer: '' }

    const delimiters = [
      '<hr>',
      '<hr />',
      '<strong>উত্তর:</strong>',
      '<strong>উত্তর :</strong>',
      '<b>উত্তর:</b>',
      '<b>উত্তর :</b>',
      'উত্তর:',
      'উত্তর :',
      '<strong>Ans:</strong>',
      '<strong>Answer:</strong>',
      'Ans:',
      'Answer:',
    ]

    for (const delimiter of delimiters) {
      if (text.includes(delimiter)) {
        const parts = text.split(delimiter)
        return {
          question: parts[0].trim(),
          answer: parts.slice(1).join(delimiter).trim(),
        }
      }
    }

    const regex = /(<p>)?\s*(উত্তর|Ans|Answer)\s*:\s*(<\/p>)?/i
    const match = text.match(regex)
    if (match && match.index !== undefined) {
      return {
        question: text.substring(0, match.index).trim(),
        answer: text.substring(match.index + match[0].length).trim(),
      }
    }

    return { question: text, answer: '' }
  }

  if (!segments.segmentK && !segments.segmentKh && !segments.segmentG && !segments.segmentGh) {
    const subQuestions = item.subQuestions
    if (typeof subQuestions === 'string' && subQuestions.trim()) {
      try {
        const arr = JSON.parse(subQuestions)
        if (Array.isArray(arr)) {
          const labelMap: Record<string, { q: 'segmentK' | 'segmentKh' | 'segmentG' | 'segmentGh'; s: 'solutionK' | 'solutionKh' | 'solutionG' | 'solutionGh' }> = {
            'ক': { q: 'segmentK', s: 'solutionK' },
            'খ': { q: 'segmentKh', s: 'solutionKh' },
            'গ': { q: 'segmentG', s: 'solutionG' },
            'ঘ': { q: 'segmentGh', s: 'solutionGh' },
          }
          for (const entry of arr) {
            const keys = labelMap[String(entry?.label || '')]
            if (keys) {
              const parsed = splitQuestionAndAnswer(String(entry?.text || ''))
              segments[keys.q] = parsed.question
              segments[keys.s] = parsed.answer
            }
          }
        }
      } catch {
        // ignore malformed JSON
      }
    }
  }

  if (!segments.segmentK && item.subQuestionA) {
    const parsed = splitQuestionAndAnswer(String(item.subQuestionA))
    segments.segmentK = parsed.question
    segments.solutionK = parsed.answer
  }
  if (!segments.segmentKh && item.subQuestionB) {
    const parsed = splitQuestionAndAnswer(String(item.subQuestionB))
    segments.segmentKh = parsed.question
    segments.solutionKh = parsed.answer
  }
  if (!segments.segmentG && item.subQuestionC) {
    const parsed = splitQuestionAndAnswer(String(item.subQuestionC))
    segments.segmentG = parsed.question
    segments.solutionG = parsed.answer
  }

  return segments
}
