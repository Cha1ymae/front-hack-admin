import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable, type Column } from '@/components/tables/data-table'

type Row = { id: string; name: string }

const columns: Column<Row>[] = [
  { key: 'name', header: 'Nom', cell: (r) => r.name },
]

describe('DataTable', () => {
  it('affiche les lignes', () => {
    render(
      <DataTable
        columns={columns}
        data={[
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ]}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('affiche le message vide', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Rien ici" />)
    expect(screen.getByText('Rien ici')).toBeInTheDocument()
  })
})
