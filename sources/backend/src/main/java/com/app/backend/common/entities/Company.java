package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "companies", schema = "business")
public class Company {
@jakarta.persistence.Id
@jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
@jakarta.persistence.Column(name = "id", nullable = false)
private java.lang.Long id;

@org.hibernate.annotations.ColumnDefault("uuidv7()")
@jakarta.persistence.Column(name = "uuid", nullable = false)
private java.util.UUID uuid = java.util.UUID.randomUUID();

@jakarta.validation.constraints.Size(max = 20)
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "tax_code", nullable = false, length = 20)
private java.lang.String taxCode;

@jakarta.validation.constraints.Size(max = 255)
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "name", nullable = false)
private java.lang.String name;

@jakarta.validation.constraints.Size(max = 500)
@jakarta.persistence.Column(name = "address", length = 500)
private java.lang.String address;

@jakarta.validation.constraints.Size(max = 20)
@jakarta.persistence.Column(name = "phone", length = 20)
private java.lang.String phone;

@jakarta.validation.constraints.Size(max = 255)
@jakarta.persistence.Column(name = "email")
private java.lang.String email;

@org.hibernate.annotations.ColumnDefault("'ACTIVE'")
@jakarta.persistence.Column(name = "status", length = 30)
private java.lang.String status = "ACTIVE";

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_create")
private com.app.backend.common.entities.Account accountCreate;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_update")
private com.app.backend.common.entities.Account accountUpdate;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account_delete")
private com.app.backend.common.entities.Account accountDelete;

@jakarta.validation.constraints.NotNull
@org.hibernate.annotations.ColumnDefault("now()")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;

@jakarta.persistence.Column(name = "updated_at")
private java.time.OffsetDateTime updatedAt;

@jakarta.persistence.Column(name = "deleted_at")
private java.time.OffsetDateTime deletedAt;



}