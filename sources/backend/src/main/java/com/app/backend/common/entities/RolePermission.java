package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "role_permissions", schema = "auth")
public class RolePermission {
@jakarta.persistence.EmbeddedId
private com.app.backend.common.entities.RolePermissionId id;

@jakarta.persistence.MapsId("role")
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_role", nullable = false)
private com.app.backend.common.entities.Role role;

@jakarta.persistence.MapsId("permission")
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_permission", nullable = false)
private com.app.backend.common.entities.Permission permission;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_create")
private com.app.backend.common.entities.Account accountCreate;

@jakarta.validation.constraints.NotNull
@org.hibernate.annotations.ColumnDefault("now()")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;



}