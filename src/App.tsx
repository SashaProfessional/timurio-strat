import React, { useEffect, useState } from 'react';
import Decimal from 'decimal.js';

import { KneeInfo } from './types';

import './App.css';

function App() {
  const [balance, setBalance] = useState("")
  const [percent, setPercent] = useState("")
  const [kneeQuantity, setKneeQuantity] = useState("")
  const [multiplier, setMultiplier] = useState("")
  const [leverage, setLeverage] = useState("")

  const [target, setTarget] = useState<number | null>(null)
  const [roe, setRoe] = useState<number | null>(null)

  const [kneeInfos, setKneeInfos] = useState<KneeInfo[]>([])

  const [isError, setIsError] = useState(false)

  useEffect(() => {
    setIsError(false)

    if (!balance || !percent || !kneeQuantity || !multiplier || !leverage) {
      setTarget(null)
      setRoe(null)
      setKneeInfos([])

      return;
    }

    const balanceDecimal = new Decimal(balance)
    const multiplierDecimal = new Decimal(multiplier)

    const newTarget = balanceDecimal.mul(percent).dividedBy(100).toDP(2)

    const newKneeInfos: KneeInfo[] = []
    const b1 = balanceDecimal.mul(new Decimal(1).sub(multiplierDecimal)).dividedBy(new Decimal(1).sub(multiplierDecimal.toPower(kneeQuantity)))

    if (b1.isNaN()) {
      setTarget(null)
      setRoe(null)
      setKneeInfos([])
      setIsError(true)
    }

    for (let i = 0; i < +kneeQuantity; i++) {
      const index = new Decimal(i + 1)
      const margin = b1.mul(multiplierDecimal.toPower(index.minus(1))).toDP(2)

      newKneeInfos.push({
        index: index.toNumber(),
        margin: margin.toNumber(),
        sum: b1.mul(new Decimal(1).minus(multiplierDecimal.toPower(index))).dividedBy(new Decimal(1).minus(multiplier)).toDP(2).toNumber(),
        quantity: margin.mul(leverage).toDP(2).toNumber()
      })

    }

    setTarget(newTarget.toNumber())
    setRoe(newTarget.dividedBy(b1).mul(100).toNumber())
    setKneeInfos(newKneeInfos)
  }, [balance, percent, kneeQuantity, multiplier, leverage])

  const onBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBalance(getValidatedNumberInput(e))
  }

  const onPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercent(getValidatedNumberInput(e, 2, 1000))
  }

  const onKneeQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKneeQuantity(getValidatedNumberInput(e, 0, 20))
  }

  const onMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiplier(getValidatedNumberInput(e))
  }

  const onLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeverage(getValidatedNumberInput(e))
  }

  const getValidatedNumberInput = (e: React.ChangeEvent<HTMLInputElement>, decimalPoints = 2, max = Number.MAX_SAFE_INTEGER) => {
    let value = e.target.value

    if (!value) {
      return "";
    }

    if (value[0] === '.') {
      return "";
    }

    if (value.includes('-')) {
      value = value.replaceAll('-', '')
    }

    let lastDotIndex = value.lastIndexOf('.')

    while (value.indexOf('.') !== value.lastIndexOf('.')) {
      lastDotIndex = value.lastIndexOf('.')
      value = value.substring(0, lastDotIndex - 1) + value.substring(lastDotIndex, value.length)
    }

    let parcedValue = new Decimal(value)

    if (parcedValue.decimalPlaces() > decimalPoints) {
      value = parcedValue.toDP(decimalPoints).toString()
    }

    return value
  }

  return (
    <div className="app">
      <div className='inputs-wrapper'>
        <div className='input-wrapper'>
          <span>Баланс</span>
          <input type="number" inputMode="numeric" value={balance} onChange={onBalanceChange} />
        </div>
        <div className='input-wrapper'>
          <span>Процент</span>
          <input type="number" inputMode="numeric" value={percent} onChange={onPercentChange} />
        </div>
        <div className='input-wrapper'>
          <span>Колени</span>
          <input type="number" inputMode="numeric" value={kneeQuantity} onChange={onKneeQuantityChange} />
        </div>
        <div className='input-wrapper'>
          <span>Мн. колен</span>
          <input type="number" inputMode="numeric" value={multiplier} onChange={onMultiplierChange} />
        </div>
        <div className='input-wrapper'>
          <span>Плечо</span>
          <input type="number" inputMode="numeric" value={leverage} onChange={onLeverageChange} />
        </div>
      </div>

      {kneeInfos.length && !isError ?
        <>
          <div className='summary-wrapper'>
            <div>Цель: ${target}</div>
            <div>ROE: {roe}%</div>
          </div>

          <div className='table-wrapper'>
            <table>
              <thead>
                <tr>
                  <th>Колено</th>
                  <th>Маржа</th>
                  <th>Сумма</th>
                  <th>Кол-во (USDT)</th>
                </tr>
              </thead>
              <tbody>
                {kneeInfos.map(kneeInfo =>
                  <tr key={kneeInfo.index}>
                    <td>{kneeInfo.index}</td>
                    <td>{kneeInfo.margin}</td>
                    <td>{kneeInfo.sum}</td>
                    <td>{kneeInfo.sum}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
        : null}

      {isError ? <div className='error-wrapper'>Невозможно вычислить</div> : null}
    </div>
  );
}

export default App;
