package com.ruralnetwork.dto.mapper;

/**
 * Mapper pour les conversions DTO - Entité
 * Utilise le pattern Builder pour la flexibilité
 */
public abstract class BaseMapper<E, D> {
    
    /**
     * Mapper une entité vers son DTO
     */
    public abstract D toDTO(E entity);
    
    /**
     * Mapper un DTO vers son entité
     */
    public abstract E toEntity(D dto);
}
