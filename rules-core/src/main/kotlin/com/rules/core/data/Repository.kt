package com.rules.core.data

import com.rules.core.models.AttributeDefinition
import com.rules.core.models.Entry
import com.rules.core.models.Rule
import java.util.UUID

interface Repository<T> {
    fun getAll(): List<T>
    fun findById(id: UUID): T?
    fun save(entity: T)
    fun delete(id: UUID)
}

typealias AttributeRepository = Repository<AttributeDefinition>

typealias RuleRepository = Repository<Rule>

typealias EntryRepository = Repository<Entry>
