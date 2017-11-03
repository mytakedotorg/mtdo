
/**
 * Here's the outline of our form infrastructure:
 * 
 * - {@link FormDef} defines the schema for a form.
 * - {@link FormValidation} models errors at the field-level and the whole-form level, as well as an optional success message.
 * - {@link FormValidation#markup(String)} creates a {@link FormMarkup} object, which can be passed as an argument to a Rocker template for creating a form and displaying errors.
 * 
 * To make it easy to define per-field validation, we have the {@link forms.meta} package.  Here is its outline:
 * 
 * - {@link forms.meta.MetaField} represents a single field in a form.
 * - {@link forms.meta.MetaFormDef} is an implementation of {@link FormDef} based on a set of {@link forms.meta.MetaField}s.
 * - You can easily use {@link forms.meta.Validator} to do per-field validation.
 * - {@link forms.meta.MetaFormValidation} is an implementation of FormValidation with convenience methods for MetaField.
 * 
 * Here's how it looks in practice:
 * 
 * ```java
 * // define a model class 
 * public class EasyTrial extends MetaFormDef {
 *     public static final MetaField<String> EMAIL = MetaField.string("email");
 *     public static final MetaField<String> PHONE = MetaField.string("phone");
 *     public static final MetaField<Boolean> MAILINGLIST = MetaField.bool("mailinglist");
 *     
 *     @Override
 *     public Set<MetaField<?>> fields() {
 *         return ImmutableSet.of(EMAIL, PHONE, MAILINGLIST);
 *     }
 *     
 *     @Override
 *     protected void validate(MetaFormValidation validation) {
 *         Validator.email().validate(validation, EMAIL);
 *         Validator.phoneNumber().validate(validation, PHONE);
 *         // if there were errors, init them here
 *         if (!validation.noErrors()) {
 *             validation.init(EMAIL, PHONE);
 *         }
 *     }
 * }
 * 
 * // define a controller for the empty template
 * env.router().get(URL_features_simulink, () -> {
 *     FormMarkup markup = FormMarkup.empty(EasyTrial.class, "/url/for/post")
 *     return views.Marketing.featuresSimulink.template(markup);
 * });
 * env.router().post(URL_features_simulink, (req) -> {
 *     MetaFormValidation validation = FormValidation.validateMeta(EasyTrial.class, req.params());
 *     if (validation.noErrors()) {
 *         String email = validation.parsed(EasyTrial.EMAIL);
 *         String phone = validation.parsed(EasyTrial.PHONE);
 *         boolean mailingList = validation.parsed(EasyTrial.MAILINGLIST);
 *         // do something with the parsed and validated result
 *     } else {
 *         // display errors
 *         return views.Marketing.featuresSimulink.template(validation.markup("/url/for/post"));
 *     }
 * });
 * ```
 * 
 * Then, in the template, the FormMarkup object makes it easy to build the form:
 * 
 * ```html
 * @import forms.EasyTrial
 * 
 * @args (forms.api.FormMarkup easyTrial)
 * 
 * 
 * @easyTrial.openForm("id", "htmlForm")
 * // <form action="/url/for/post" method="post" id="htmlForm">
 * 
 * @easyTrial.field("email").errorSpan().label("Email").input("email", "class", "form-control")
 * // <span class="error">Some error message</span>  // only if there is an error
 * // <label for="email">Email</label>
 * // <input name="email" type="email" class="form-control"
 * @easyTrial.field("phone").errorSpan().label("Phone").input("tel", "class", "form-control")
 * @easyTrial.field("mailinglist").errorSpan().label("Notify me about new features via email").input("checkbox", "checked", null)
 * <input type="submit" value="Send me a trial right now" name="subscribe" id="mc-embedded-subscribe"
 *         class="button btn btn-primary pull-right">
 * @easyTrial.closeForm()
 * // </form> (also adds CSRF and checks that all fields were used) 
 *
 * @easyTrial.formError()
 * @easyTrial.formSuccess()
 * // adds a div with `class="alert alert-success"` or the same for error
 * ```
 */
package forms.api;
