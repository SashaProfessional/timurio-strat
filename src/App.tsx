import React, { useEffect, useState } from 'react';
import Decimal from 'decimal.js';

import { KneeInfo } from './types';

import './App.css';

function App() {
  const [balance, setBalance] = useState<Decimal | null>(null)
  const [percent, setPercent] = useState<Decimal | null>(null)
  const [kneeQuantity, setKneeQuantity] = useState<Decimal | null>(null)
  const [multiplier, setMultiplier] = useState<Decimal | null>(null)

  const [target, setTarget] = useState<number | null>(null)
  const [roe, setRoe] = useState<number | null>(null)

  const [kneeInfos, setKneeInfos] = useState<KneeInfo[]>([])

  useEffect(() => {
    if (!balance || !percent || !kneeQuantity || !multiplier) {
      setTarget(null)
      setRoe(null)
      setKneeInfos([])

      return;
    }

    const newTarget = new Decimal(balance).mul(percent).dividedBy(100).toDP(2)

    const newKneeInfos: KneeInfo[] = []
    const b1 = balance.mul(new Decimal(1).sub(multiplier)).dividedBy(new Decimal(1).sub(multiplier.toPower(kneeQuantity)))

    for (let i = 0; i < kneeQuantity.toNumber(); i++) {
      const index = new Decimal(i + 1)
      newKneeInfos.push({
        index: index.toNumber(),
        margin: b1.mul(multiplier.toPower(index.minus(1))).toDP(2).toNumber(),
        sum: b1.mul(new Decimal(1).minus(multiplier.toPower(index))).dividedBy(new Decimal(1).minus(multiplier)).toDP(2).toNumber()
      })

    }

    setTarget(newTarget.toNumber())
    setRoe(newTarget.dividedBy(b1).mul(100).toNumber())
    setKneeInfos(newKneeInfos)
  }, [balance, percent, kneeQuantity, multiplier])

  const onBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBalance(getValidatedNumberInput(e.target.value))
  }

  const onPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercent(getValidatedNumberInput(e.target.value, 2, 1000))
  }

  const onKneeQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKneeQuantity(getValidatedNumberInput(e.target.value, 0, 20))
  }

  const onMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMultiplier(getValidatedNumberInput(e.target.value))
  }

  const getValidatedNumberInput = (value: string, decimalPoints = 2, max = Number.MAX_SAFE_INTEGER) => {
    if (!value) {
      return null;
    }

    let parcedValue = new Decimal(value).toDP(decimalPoints)

    if (parcedValue.lessThan(0)) {
      parcedValue = parcedValue.abs()
    }

    if (parcedValue.greaterThan(max)) {
      return new Decimal(max)
    }

    return parcedValue
  }

  return (
    <div className="app">
      <div className='inputs-wrapper'>
        <div className='input-wrapper'>
          <span>Баланс</span>
          <input type="number" inputMode="numeric" value={balance?.toNumber() ?? ''} onChange={onBalanceChange} />
        </div>
        <div className='input-wrapper'>
          <span>Процент</span>
          <input type="number" inputMode="numeric" value={percent?.toNumber() ?? ''} onChange={onPercentChange} />
        </div>
        <div className='input-wrapper'>
          <span>Колени</span>
          <input type="number" inputMode="numeric" value={kneeQuantity?.toNumber() ?? ''} onChange={onKneeQuantityChange} />
        </div>
        <div className='input-wrapper'>
          <span>Мн. колен</span>
          <input type="number" inputMode="numeric" value={multiplier?.toNumber() ?? ''} onChange={onMultiplierChange} />
        </div>
      </div>

      {kneeInfos.length ?
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
                </tr>
              </thead>
              <tbody>
                {kneeInfos.map(kneeInfo =>
                  <tr key={kneeInfo.index}>
                    <td>{kneeInfo.index}</td>
                    <td>{kneeInfo.margin}</td>
                    <td>{kneeInfo.sum}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
        : null}
    </div>
  );
}

export default App;
