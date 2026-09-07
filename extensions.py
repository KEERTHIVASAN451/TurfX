# =========================================================
# TurfX - Flask Extensions & Database Adapter (MongoDB Atlas)
# File: extensions.py
# =========================================================

import os
from flask_mail import Mail
import mongoengine as me
from mongoengine.base.fields import BaseField

# Initialize Mail
mail = Mail()

# Default MongoDB URI from Atlas credentials
_DEFAULT_MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://kv0939169_db_user:HOCLrddiK8iliBE5@turfx-booking.o64agpk.mongodb.net/turfx?retryWrites=true&w=majority"
)

# Initialize default connection eagerly so Document models can be inspected
try:
    me.connect(host=_DEFAULT_MONGODB_URI, db="turfx", alias="default", uuidRepresentation="standard")
except Exception as _conn_err:
    pass

# ---------------------------------------------------------
# MONGOENGINE FIELD QUERY OPERATORS
# Enables SQLAlchemy-style query expressions on Document fields:
# Model.field == val, Model.field != val, Model.field.in_(...),
# Model.field.is_(val), Model.field.ilike(pattern), Model.field.desc()
# ---------------------------------------------------------

BaseField.__eq__ = lambda self, other: (self.name, other)
BaseField.__ne__ = lambda self, other: (self.name + "__ne", other)
BaseField.in_ = lambda self, items: (self.name + "__in", list(items))
BaseField.is_ = lambda self, other: (self.name, other)
BaseField.desc = lambda self: "-" + self.name
BaseField.asc = lambda self: "+" + self.name
BaseField.ilike = lambda self, pattern: (self.name + "__icontains", pattern.strip("%") if isinstance(pattern, str) else pattern)


def or_(*expressions):
    """SQLAlchemy-compatible or_ operator mapping to MongoEngine Q objects."""
    q_result = me.Q()
    for expr in expressions:
        if isinstance(expr, tuple):
            q_result = q_result | me.Q(**{expr[0]: expr[1]})
        elif isinstance(expr, me.Q):
            q_result = q_result | expr
        elif isinstance(expr, dict):
            q_result = q_result | me.Q(**expr)
    return q_result


class MongoQueryWrapper:
    """SQLAlchemy Query-compatible wrapper for MongoEngine Document querysets."""

    def __init__(self, doc_cls, filters=None, order=None, q_obj=None):
        self.doc_cls = doc_cls
        self.filters = dict(filters or {})
        self.order_by_list = list(order or [])
        self.q_obj = q_obj

    def filter_by(self, **kwargs):
        new_f = dict(self.filters)
        new_f.update(kwargs)
        return MongoQueryWrapper(self.doc_cls, new_f, self.order_by_list, self.q_obj)

    def filter(self, *expressions):
        new_f = dict(self.filters)
        new_q = self.q_obj
        for expr in expressions:
            if isinstance(expr, tuple):
                new_f[expr[0]] = expr[1]
            elif isinstance(expr, me.Q):
                new_q = (new_q & expr) if new_q else expr
            elif isinstance(expr, dict):
                new_f.update(expr)
        return MongoQueryWrapper(self.doc_cls, new_f, self.order_by_list, new_q)

    def with_for_update(self):
        return self

    def order_by(self, *orders):
        new_orders = list(self.order_by_list)
        for o in orders:
            if callable(o):
                o = o()
            if hasattr(o, "desc"):
                new_orders.append(o.desc())
            elif isinstance(o, str):
                new_orders.append(o)
        return MongoQueryWrapper(self.doc_cls, self.filters, new_orders, self.q_obj)

    def _get_queryset(self):
        qs = self.doc_cls.objects
        if self.q_obj:
            qs = qs.filter(self.q_obj)
        if self.filters:
            qs = qs.filter(**self.filters)
        if self.order_by_list:
            qs = qs.order_by(*self.order_by_list)
        return qs

    def first(self):
        return self._get_queryset().first()

    def all(self):
        return list(self._get_queryset())

    def count(self):
        return self._get_queryset().count()

    def get(self, ident):
        try:
            return self.doc_cls.objects(id=int(ident)).first()
        except Exception:
            return None

    def __iter__(self):
        return iter(self.all())


class MongoSessionCompat:
    """SQLAlchemy Session-compatible interface for MongoEngine."""

    def add(self, obj):
        if hasattr(obj, "save"):
            obj.save()

    def commit(self):
        pass

    def rollback(self):
        pass

    def delete(self, obj):
        if hasattr(obj, "delete"):
            obj.delete()

    def get(self, model_cls, ident):
        if hasattr(model_cls, "objects"):
            try:
                return model_cls.objects(id=int(ident)).first()
            except Exception:
                return None
        return None


class MongoDatabaseCompat:
    """SQLAlchemy-compatible database manager pointing to MongoDB Atlas."""

    def __init__(self):
        self.session = MongoSessionCompat()
        self.client = None

    def init_app(self, app):
        uri = app.config.get("MONGODB_URI", _DEFAULT_MONGODB_URI)
        db_name = app.config.get("MONGODB_DB", "turfx")
        try:
            me.disconnect(alias="default")
        except Exception:
            pass
        try:
            me.connect(host=uri, db=db_name, alias="default", uuidRepresentation="standard")
            print("[Success] Connected to MongoDB Atlas successfully!")
        except Exception as err:
            print(f"[Warning] MongoDB connection deferred: {err}")

    def create_all(self):
        # In MongoDB, collections are created automatically upon inserting documents
        return True


# Database instance shared across the app
db = MongoDatabaseCompat()
