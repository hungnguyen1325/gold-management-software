package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter@jakarta.persistence.Entity
@jakarta.persistence.Table(name = "employees", schema = "business")
public class Employee {
@jakarta.persistence.Id
@jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
@jakarta.persistence.Column(name = "id", nullable = false)
private java.lang.Long id;

@org.hibernate.annotations.ColumnDefault("uuidv7()")
@jakarta.persistence.Column(name = "uuid", nullable = false)
private java.util.UUID uuid = java.util.UUID.randomUUID();

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_company")
private com.app.backend.common.entities.Company company;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_branch")
private com.app.backend.common.entities.Branch branch;

@jakarta.persistence.Column(name = "full_name", length = 150)
private java.lang.String fullName;

@jakarta.persistence.Column(name = "phone", length = 20)
private java.lang.String phone;

@jakarta.persistence.Column(name = "email", length = 150)
private java.lang.String email;

@jakarta.persistence.OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.SET_NULL)
@jakarta.persistence.JoinColumn(name = "fk_account")
private com.app.backend.common.entities.Account account;

@jakarta.persistence.ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
@org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.RESTRICT)
@jakarta.persistence.JoinColumn(name = "fk_role")
private com.app.backend.common.entities.Role role;

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

@org.hibernate.annotations.ColumnDefault("now()")
@jakarta.persistence.Column(name = "created_at", nullable = false)
private java.time.OffsetDateTime createdAt;

@jakarta.persistence.Column(name = "updated_at")
private java.time.OffsetDateTime updatedAt;

@jakarta.persistence.Column(name = "deleted_at")
private java.time.OffsetDateTime deletedAt;



}