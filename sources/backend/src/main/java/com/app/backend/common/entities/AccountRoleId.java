package com.app.backend.common.entities;

@lombok.Getter
@lombok.Setter
@lombok.EqualsAndHashCode@jakarta.persistence.Embeddable
public class AccountRoleId {
@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "fk_account", nullable = false)
private java.lang.Long account;

@jakarta.validation.constraints.NotNull
@jakarta.persistence.Column(name = "fk_role", nullable = false)
private java.lang.Long role;



}