package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "permissions", schema = "auth")
public class Permission {
@jakarta.persistence.Id
@jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
@jakarta.persistence.Column(name = "id", nullable = false)
private java.lang.Long id;

@org.hibernate.annotations.ColumnDefault("uuidv7()")
@jakarta.persistence.Column(name = "uuid", nullable = false)
private java.util.UUID uuid = java.util.UUID.randomUUID();

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_create")
private com.app.backend.common.entities.Account accountCreate;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_update")
private com.app.backend.common.entities.Account accountUpdate;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_parent")
private com.app.backend.common.entities.Permission parent;

@jakarta.validation.constraints.Size(max = 100)
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "code", nullable = false, length = 100)
private java.lang.String code;

@jakarta.validation.constraints.Size(max = 255)
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "name", nullable = false)
private java.lang.String name;

@jakarta.validation.constraints.Size(max = 500)
@jakarta.persistence.Column(name = "description", length = 500)
private java.lang.String description;

@jakarta.validation.constraints.NotNull
@org.hibernate.annotations.ColumnDefault("now()")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;

@jakarta.persistence.Column(name = "updated_at")
private java.time.OffsetDateTime updatedAt;



}