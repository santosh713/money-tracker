// File: /app/page.tsx (Next.js 13+ with App Router and Tailwind)
'use client'

import { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Moon, Sun, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function Home() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [type, setType] = useState<'given' | 'taken'>('given')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [showAmount, setShowAmount] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [darkMode, setDarkMode] = useState(false)

  const handleSubmit = async () => {
    if (!name || !amount || !date) return
    const newTransaction = {
      name,
      amount: parseFloat(amount),
      date: date.toISOString(),
      type,
    }
    const { data } = await axios.post('/api/transaction', newTransaction)
    setTransactions(data)
    setName('')
    setAmount('')
    setDate(new Date())
  }

  const handleDelete = async (index: number) => {
    const { data } = await axios.delete(`/api/transaction?index=${index}`)
    setTransactions(data)
  }

  const totalGiven = transactions.filter(t => t.type === 'given').reduce((acc, t) => acc + t.amount, 0)
  const totalTaken = transactions.filter(t => t.type === 'taken').reduce((acc, t) => acc + t.amount, 0)

  const chartData = {
    labels: ['To Give', 'To Take'],
    datasets: [
      {
        label: 'Money Flow',
        data: [totalGiven, totalTaken],
        backgroundColor: ['#34D399', '#F87171'],
        borderWidth: 1,
      },
    ],
  }

  useEffect(() => {
    (async () => {
      const { data } = await axios.get('/api/transaction')
      setTransactions(data)
    })()
  }, [])

  return (
    <div className={darkMode ? 'dark bg-zinc-900 text-white min-h-screen p-4' : 'bg-white text-black min-h-screen p-4'}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">💸 Money Exchange Tracker</h1>
        <Button onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun /> : <Moon />}</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Given</span>
            <Switch checked={type === 'taken'} onCheckedChange={(val) => setType(val ? 'taken' : 'given')} />
            <span>Taken</span>
          </div>
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <div className="relative">
            <Input type={showAmount ? 'text' : 'password'} placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
            <button className="absolute right-2 top-2" onClick={() => setShowAmount(!showAmount)}>
              {showAmount ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          <Button className="w-full" onClick={handleSubmit}>Add Transaction</Button>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl">
          <Pie data={chartData} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Transaction Log</h2>
        <ul className="space-y-2">
          {transactions.map((t, idx) => (
            <li key={idx} className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-700 p-2 rounded">
              <span>{t.name}</span>
              <span>{t.type}</span>
              <span>{showAmount ? `$${t.amount}` : '****'}</span>
              <span>{moment(t.date).format('YYYY-MM-DD')}</span>
              <Button variant="outline" onClick={() => handleDelete(idx)}>🗑️</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
