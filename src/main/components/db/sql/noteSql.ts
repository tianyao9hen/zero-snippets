import * as execute from '../sql'

export const add = (note: Partial<NoteEntity>) => {
  return execute.insert(
    `
    insert into snippets_notes(
      type_id,
      note_type,
      name,
      note
    ) values (
      $typeId,
      $noteType,
      $name,
      $note
    )
    `,
    {
      typeId: note.typeId || 4,
      noteType: note.noteType || 0,
      name: note.name!,
      note: note.note!
    }
  )
}

export const edit = (note: Partial<NoteEntity>) => {
  return execute.edit(
    `
    update snippets_notes
    set
      note_type = $noteType,
      name = $name,
      note = $note
    where
      id = $id
    `,
    {
      id: note.id!,
      noteType: note.noteType!,
      name: note.name!,
      note: note.note!
    }
  )
}

export const remove = (id: number) => {
  return execute.remove(
    `
    delete from snippets_notes
    where
      id = $id
    `,
    {
      id
    }
  )
}

export const listAll = () => {
  return execute.findAll(
    `
    select
      id,
      type_id as typeId,
      note_type as noteType,
      name,
      note,
      create_time as createTime
    from snippets_notes
    order by create_time desc
    `,
    {}
  ) as NoteEntity[]
}

export const getById = (id: number) => {
  return execute.findOne(
    `
    select
      id,
      type_id as typeId,
      note_type as noteType,
      name,
      note,
      create_time as createTime
    from snippets_notes
    where
      id = $id
    `,
    {
      id
    }
  ) as NoteEntity
}
