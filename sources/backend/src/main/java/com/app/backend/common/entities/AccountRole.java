package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "account_roles", schema = "auth")
public class AccountRole {
@jakarta.persistence.EmbeddedId
private com.app.backend.common.entities.AccountRoleId id;

@jakarta.persistence.MapsId("account")
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_account", nullable = false)
private com.app.backend.common.entities.Account account;

@jakarta.persistence.MapsId("role")
@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_role", nullable = false)
private com.app.backend.common.entities.Role role;

@jakarta.validation.constraints.NotNull
@org.hibernate.annotations.ColumnDefault("now()")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;

@jakarta.persistence.Column(name = "updated_at")
private java.time.OffsetDateTime updatedAt;



}