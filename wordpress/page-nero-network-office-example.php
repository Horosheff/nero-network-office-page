<?php
/**
 * Template Name: Nero Network Office Example
 * Description: Minimal portable page template generated for first-run checks.
 */

get_header();
?>

<main id="primary" class="site-main nero-office-example-page">
  <section class="nero-office-hero" aria-labelledby="nero-office-title">
    <div class="nero-office-wrap">
      <p class="nero-office-eyebrow">Nero Network Office Page 0.1</p>
      <h1 id="nero-office-title">WordPress-страница готова к настройке</h1>
      <p class="nero-office-lead">
        Этот шаблон проверяет, что плагин может подготовить отдельную страницу,
        а публикация идёт в активную тему WordPress без личных данных в коде.
      </p>
      <a class="nero-office-button" href="<?php echo esc_url(home_url('/')); ?>">
        Вернуться на сайт
      </a>
    </div>
  </section>
</main>

<style>
  .nero-office-example-page {
    margin: 0;
    padding: 0;
    background: #f8fafc;
    color: #0f172a;
  }

  .nero-office-hero {
    min-height: 72vh;
    display: grid;
    place-items: center;
    padding: clamp(48px, 8vw, 96px) 20px;
    background:
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.14), transparent 34%),
      linear-gradient(135deg, #ffffff 0%, #eef2ff 100%);
  }

  .nero-office-wrap {
    width: min(960px, 100%);
    padding: clamp(28px, 5vw, 56px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.86);
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
  }

  .nero-office-eyebrow {
    margin: 0 0 14px;
    color: #2563eb;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .nero-office-hero h1 {
    margin: 0;
    max-width: 760px;
    font-size: clamp(38px, 6vw, 72px);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  .nero-office-lead {
    max-width: 720px;
    margin: 24px 0 0;
    color: #475569;
    font-size: clamp(18px, 2vw, 22px);
    line-height: 1.6;
  }

  .nero-office-button {
    display: inline-flex;
    margin-top: 32px;
    padding: 14px 20px;
    border-radius: 999px;
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
</style>

<?php
get_footer();
