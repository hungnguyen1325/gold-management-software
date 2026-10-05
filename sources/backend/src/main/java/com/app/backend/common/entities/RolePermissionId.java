package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter
@lombok.EqualsAndHashCode@jakarta.persistence.Embeddable
public class RolePermissionId {
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "fk_role", nullable = false)
private java.lang.Long role;

@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "fk_permission", nullable = false)
private java.lang.Long permission;



}