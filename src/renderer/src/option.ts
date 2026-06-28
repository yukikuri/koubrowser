import 'bulma/css//bulma.min.css'

import './assets/option.css'

interface CategoryInfo {
  readonly title: string
  readonly description: string
}

const categories: Record<string, CategoryInfo> = {
  general: {
    title: '一般',
    description: '基本的な動作に関する設定です。'
  },
  window: {
    title: 'ウインドウ',
    description: 'メインウインドウと別ウインドウの表示に関する設定です。'
  },
  assist: {
    title: 'アシスト',
    description: 'ゲーム内アシスト表示とアシストウインドウに関する設定です。'
  },
  record: {
    title: '記録',
    description: 'スクリーンショット、録画、ローカル記録に関する設定です。'
  }
}

const heading = document.querySelector<HTMLHeadingElement>('#option-heading')
const description = document.querySelector<HTMLParagraphElement>('#option-description')
const callMainButton = document.querySelector<HTMLButtonElement>('#call-main-button')
const callMainResult = document.querySelector<HTMLSpanElement>('#call-main-result')
const categoryButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('.option-category')
)

const setCategory = (categoryKey: string): void => {
  const category = categories[categoryKey]
  if (!category || !heading || !description) {
    return
  }

  heading.textContent = category.title
  description.textContent = category.description

  categoryButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.category === categoryKey)
  })
}

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.category) {
      setCategory(button.dataset.category)
    }
  })
})

callMainButton?.addEventListener('click', async () => {
  if (!callMainResult) {
    return
  }

  callMainResult.textContent = '実行中...'
  try {
    callMainResult.textContent = await window.optionApi.callMain()
  } catch (err: unknown) {
    console.error(err)
    callMainResult.textContent = '呼び出しに失敗しました。'
  }
})
