package com.rules.core

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.UUID

class EvaluationResultTest {

    @Test
    fun `should create evaluation result`() {
        val attributeId1 = UUID.randomUUID()
        val attributeId2 = UUID.randomUUID()
        val attributeScores = mapOf(attributeId1 to 10, attributeId2 to 5)

        val result = EvaluationResult(attributeScores = attributeScores, totalScore = 15)

        assertEquals(attributeScores, result.attributeScores)
        assertEquals(15, result.totalScore)
    }

    @Test
    fun `should handle empty attribute scores`() {
        val result = EvaluationResult(attributeScores = emptyMap(), totalScore = 0)

        assertTrue(result.attributeScores.isEmpty())
        assertEquals(0, result.totalScore)
    }
}
